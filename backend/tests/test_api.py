NEW_CASE = {
    "title": "VPN caída",
    "description": "No conecta desde esta mañana",
    "category": "INCIDENT",
    "priority": "HIGH",
}


def create_case(client, headers) -> dict:
    res = client.post("/api/cases", json=NEW_CASE, headers=headers)
    assert res.status_code == 201, res.text
    return res.json()


# ---- autenticación ----

def test_login_ok_devuelve_token_y_usuario_sin_password(client):
    res = client.post("/api/auth/login", json={"email": "ana@test.com", "password": "password123"})
    assert res.status_code == 200
    body = res.json()
    assert body["token"] and body["user"]["role"] == "REQUESTER"
    assert "password" not in body["user"] and "passwordHash" not in body["user"]


def test_login_con_credenciales_invalidas(client):
    res = client.post("/api/auth/login", json={"email": "ana@test.com", "password": "mala"})
    assert res.status_code == 401
    assert res.json()["error"] == "Credenciales inválidas"


def test_endpoint_protegido_sin_token(client):
    assert client.get("/api/cases").status_code == 401


def test_me_y_logout_invalida_el_token(client, requester):
    assert client.get("/api/auth/me", headers=requester).json()["email"] == "ana@test.com"
    assert client.post("/api/auth/logout", headers=requester).status_code == 204
    assert client.get("/api/auth/me", headers=requester).status_code == 401


# ---- casos ----

def test_crear_caso_calcula_tiempo_estimado_y_registra_historial(client, requester):
    case = create_case(client, requester)
    assert case["status"] == "OPEN"
    assert case["estimatedTime"] == 8
    assert case["updates"][0]["message"] == "Caso registrado en el sistema."


def test_crear_caso_con_datos_invalidos(client, requester):
    res = client.post("/api/cases", json={**NEW_CASE, "priority": "NADA"}, headers=requester)
    assert res.status_code == 422


def test_solicitante_solo_ve_sus_casos(client, requester, other_requester, analyst):
    create_case(client, requester)
    assert len(client.get("/api/cases", headers=requester).json()) == 1
    assert client.get("/api/cases", headers=other_requester).json() == []
    assert len(client.get("/api/cases", headers=analyst).json()) == 1


def test_solicitante_no_puede_ver_caso_ajeno(client, requester, other_requester):
    case = create_case(client, requester)
    res = client.get(f"/api/cases/{case['id']}", headers=other_requester)
    assert res.status_code == 403


def test_caso_inexistente(client, analyst):
    assert client.get("/api/cases/no-existe", headers=analyst).status_code == 404


def test_solicitante_no_puede_cambiar_estado(client, requester):
    case = create_case(client, requester)
    res = client.patch(f"/api/cases/{case['id']}", json={"status": "CLOSED"}, headers=requester)
    assert res.status_code == 403


def test_analista_cierra_caso_y_queda_historial(client, requester, analyst):
    case = create_case(client, requester)
    res = client.patch(
        f"/api/cases/{case['id']}", json={"status": "CLOSED"}, headers=analyst
    )
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "CLOSED" and body["closedAt"] is not None
    last = body["updates"][-1]
    assert (last["oldStatus"], last["newStatus"]) == ("OPEN", "CLOSED")


def test_asignar_caso_a_analista(client, requester, analyst):
    case = create_case(client, requester)
    me = client.get("/api/auth/me", headers=analyst).json()
    res = client.patch(
        f"/api/cases/{case['id']}", json={"assignedToId": me["id"]}, headers=analyst
    )
    assert res.json()["assignedTo"]["name"] == "Laura Analista"


def test_no_se_puede_asignar_a_un_solicitante(client, requester, analyst):
    case = create_case(client, requester)
    other = client.get("/api/auth/me", headers=requester).json()
    res = client.patch(
        f"/api/cases/{case['id']}", json={"assignedToId": other["id"]}, headers=analyst
    )
    assert res.status_code == 400


def test_agregar_comentario(client, requester):
    case = create_case(client, requester)
    res = client.post(
        f"/api/cases/{case['id']}/updates", json={"message": "Adjunto captura"}, headers=requester
    )
    assert res.status_code == 201
    assert res.json()["author"]["name"] == "Ana Solicitante"


def test_comentario_vacio(client, requester):
    case = create_case(client, requester)
    res = client.post(f"/api/cases/{case['id']}/updates", json={"message": "  "}, headers=requester)
    assert res.status_code == 400


# ---- escalamiento ----

def test_escalar_caso_a_proveedor(client, requester, analyst):
    case = create_case(client, requester)
    res = client.post(
        f"/api/cases/{case['id']}/escalate",
        json={"providerId": "prov1", "notes": "Urgente"},
        headers=analyst,
    )
    assert res.status_code == 201
    assert res.json()["provider"]["name"] == "Telco"

    detail = client.get(f"/api/cases/{case['id']}", headers=analyst).json()
    assert detail["status"] == "WAITING_PROVIDER"
    assert detail["escalation"]["notes"] == "Urgente"


def test_no_se_puede_escalar_dos_veces(client, requester, analyst):
    case = create_case(client, requester)
    body = {"providerId": "prov1"}
    client.post(f"/api/cases/{case['id']}/escalate", json=body, headers=analyst)
    res = client.post(f"/api/cases/{case['id']}/escalate", json=body, headers=analyst)
    assert res.status_code == 409


def test_solicitante_no_puede_escalar(client, requester):
    case = create_case(client, requester)
    res = client.post(
        f"/api/cases/{case['id']}/escalate", json={"providerId": "prov1"}, headers=requester
    )
    assert res.status_code == 403


def test_listar_proveedores(client, requester):
    res = client.get("/api/providers", headers=requester)
    assert [p["name"] for p in res.json()] == ["Telco"]


# ---- usuarios ----

def test_personal_de_la_mesa_lista_usuarios_con_conteos(client, requester, analyst):
    create_case(client, requester)
    me = client.get("/api/auth/me", headers=analyst).json()
    case = client.get("/api/cases", headers=analyst).json()[0]
    client.patch(f"/api/cases/{case['id']}", json={"assignedToId": me["id"]}, headers=analyst)

    res = client.get("/api/users", headers=analyst)
    assert res.status_code == 200
    by_email = {u["email"]: u for u in res.json()}
    assert by_email["ana@test.com"]["requestedCases"] == 1
    assert by_email["laura@test.com"]["assignedCases"] == 1
    assert by_email["otro@test.com"]["requestedCases"] == 0
    assert "passwordHash" not in by_email["ana@test.com"]


def test_solicitante_no_puede_listar_usuarios(client, requester):
    assert client.get("/api/users", headers=requester).status_code == 403


def test_listar_usuarios_exige_sesion(client):
    assert client.get("/api/users").status_code == 401
