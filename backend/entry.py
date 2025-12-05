from workers import WorkerEntrypoint, Response

class Default(WorkerEntrypoint):
    async def fetch(self, request):
        results = await self.env.DB.prepare("PRAGMA table_list").run()
        return Response.json(results)
