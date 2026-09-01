def test_register_user_success(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "Password123!",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["username"] == "testuser"
    assert "password_hash" not in data["user"]


def test_register_duplicate_email(client):
    # First registration
    client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "user1",
            "password": "Password123!",
        },
    )

    # Second registration with same email
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "user2",
            "password": "Password123!",
        },
    )
    assert response.status_code == 409
    assert "email already exists" in response.json()["detail"].lower()


def test_register_duplicate_username(client):
    # First registration
    client.post(
        "/api/auth/register",
        json={
            "email": "user1@example.com",
            "username": "sameuser",
            "password": "Password123!",
        },
    )

    # Second registration with same username
    response = client.post(
        "/api/auth/register",
        json={
            "email": "user2@example.com",
            "username": "sameuser",
            "password": "Password123!",
        },
    )
    assert response.status_code == 409
    assert "username is already taken" in response.json()["detail"].lower()


def test_login_success(client):
    # Register user first
    client.post(
        "/api/auth/register",
        json={
            "email": "login@example.com",
            "username": "loginuser",
            "password": "SecretPassword123",
        },
    )

    # Login with email
    response = client.post(
        "/api/auth/login",
        json={
            "email_or_username": "login@example.com",
            "password": "SecretPassword123",
        },
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

    # Login with username
    response_user = client.post(
        "/api/auth/login",
        json={
            "email_or_username": "loginuser",
            "password": "SecretPassword123",
        },
    )
    assert response_user.status_code == 200
    assert "access_token" in response_user.json()


def test_login_invalid_credentials(client):
    client.post(
        "/api/auth/register",
        json={
            "email": "wrong@example.com",
            "username": "wronguser",
            "password": "CorrectPassword123",
        },
    )

    response = client.post(
        "/api/auth/login",
        json={
            "email_or_username": "wrong@example.com",
            "password": "WrongPassword",
        },
    )
    assert response.status_code == 401
    assert "invalid credentials" in response.json()["detail"].lower()


def test_refresh_token_success(client):
    reg_res = client.post(
        "/api/auth/register",
        json={
            "email": "refresh@example.com",
            "username": "refreshuser",
            "password": "Password123!",
        },
    ).json()

    refresh_token = reg_res["refresh_token"]

    response = client.post(
        "/api/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "refresh_token" in response.json()


def test_get_me_authenticated(client):
    reg_res = client.post(
        "/api/auth/register",
        json={
            "email": "me@example.com",
            "username": "meuser",
            "password": "Password123!",
        },
    ).json()

    access_token = reg_res["access_token"]

    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@example.com"
    assert data["username"] == "meuser"


def test_get_me_unauthenticated(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
