import httpx
import asyncio

async def run():
    async with httpx.AsyncClient() as client:
        resp = await client.get('http://localhost:3000/api/v1/internal/complaints', headers={'x-ai-service-secret': 'ellipse-ai-webhook-secret-67890'})
        data = resp.json()
        if data:
            c_id = data[0]['id']
            print(f"Testing with complaint: {c_id}")
            resp2 = await client.post('http://localhost:8000/analyze', json={
                "complaintId": c_id,
                "imageUrl": "https://placehold.co/600x400.png"
            })
            print(resp2.json())
        else:
            print("No complaints found")

if __name__ == "__main__":
    asyncio.run(run())
