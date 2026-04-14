import pytest


async def get_auth_headers(client, email="subj@example.com"):
    reg = await client.post("/auth/register", json={
        "email": email, "name": "Test", "password": "password123"
    })
    token = reg.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_create_subject(client):
    headers = await get_auth_headers(client, "subj1@example.com")
    response = await client.post("/subjects", json={"name": "Biology", "color": "#22c55e"}, headers=headers)
    assert response.status_code == 201
    assert response.json()["name"] == "Biology"


@pytest.mark.asyncio
async def test_list_subjects(client):
    headers = await get_auth_headers(client, "subj2@example.com")
    await client.post("/subjects", json={"name": "Math", "color": "#3b82f6"}, headers=headers)
    response = await client.get("/subjects", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1


@pytest.mark.asyncio
async def test_update_subject(client):
    headers = await get_auth_headers(client, "subj3@example.com")
    create = await client.post("/subjects", json={"name": "History", "color": "#f59e0b"}, headers=headers)
    subject_id = create.json()["id"]
    response = await client.patch(f"/subjects/{subject_id}", json={"name": "World History"}, headers=headers)
    assert response.status_code == 200
    assert response.json()["name"] == "World History"


@pytest.mark.asyncio
async def test_delete_subject(client):
    headers = await get_auth_headers(client, "subj4@example.com")
    create = await client.post("/subjects", json={"name": "Spanish", "color": "#ec4899"}, headers=headers)
    subject_id = create.json()["id"]
    response = await client.delete(f"/subjects/{subject_id}", headers=headers)
    assert response.status_code == 204
