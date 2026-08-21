import httpx
import asyncio
import json

async def run():
    async with httpx.AsyncClient() as client:
        resp = await client.get('http://localhost:3000/api/v1/internal/complaints', headers={'x-ai-service-secret': 'ellipse-ai-webhook-secret-67890'})
        data = resp.json()
        target = [c for c in data if c['id'] == '6908b2be-4642-4195-91f4-063f6100ee25']
        if target:
            print(json.dumps(target[0]['aiAnalysis'], indent=2))
        else:
            print("Not found")

if __name__ == "__main__":
    asyncio.run(run())
