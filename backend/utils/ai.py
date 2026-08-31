from decouple import config
from httpx import AsyncClient, Client, Timeout, stream
from pathlib import Path
from urllib.parse import urlparse
import base64
import mimetypes

API_TOKEN = config("AISTUDIO_TOKEN", None)
if API_TOKEN is None:
    raise ValueError("API_TOKEN environment variable not set")

burl = "https://api.3daistudio.com"

models = {
    "hunyuan": {
        "url": "/v1/3d-models/tencent/generate/pro/",
        "example": {
            "model": "3.0",
            "prompt": "a medieval sword with ornate handle",
            "enable_pbr": True,
            "face_count": 500000,
            "generate_type": "Normal"
        }
    },
    "trellis": {
        "url": "/v1/3d-models/trellis2/generate/",
        "example": {
            "image_url": "https://example.com/my-object.png",
            "resolution": "1024",
            "textures": True,
            "texture_size": 2048
        }
    },
    "tripo": {
        "url": "/v1/3d-models/tripo/text-to-3d/",
        "example": {
            "prompt": "a medieval sword with ornate handle",
            "texture": True,
            "pbr": True,
            "texture_quality": "standard"
        }
    }
}
def image_to_base64_data_uri(image_path: str) -> dict:
    mime_type, _ = mimetypes.guess_type(image_path)
    if mime_type is None:
        raise ValueError(f"Не удалось определить тип файла: {image_path}")

    try:
        with open(image_path, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("utf-8")
    except FileNotFoundError:
        return {"status": False, "error": "File not found"}
    except Exception as e:
        return {"status": False, "error": str(e)}

    return {"status": True, "result": f"data:{mime_type};base64,{encoded}"}

class API:
    def __init__(self):
        timeout=Timeout(
            connect=10.0,
            read=60.0,
            write=60.0,  # <-- именно это падало (WriteTimeout)
            pool=10.0,
        )
        self.aclient = AsyncClient(
            timeout=timeout,
            headers={"Authorization": f"Bearer {API_TOKEN}"},
        )
        self.client = Client(
            timeout=timeout,
            headers={"Authorization": f"Bearer {API_TOKEN}"},
        )

    def show_balance(self):
        res = self.client.get(
            url=f"{burl}/account/user/wallet/",
        )
        return res.json()

    def send_image_local(self, image_url):
        image = image_to_base64_data_uri(image_url)
        if not image["status"]:
            return {"ok": False, "error": image["error"]}

        res = self.client.post(
            url=burl + str(models["trellis"]["url"]),
            json={
                "image": image["result"],
                "resolution": "1024",
                "textures": True,
                "texture_size": 2048
            }
        )
        return res.json()

    def send_image(self, image_url):
        res = self.client.post(
            url=burl + str(models["trellis"]["url"]),
            json={
                "image_url": image_url,
                "resolution": "1024",
                "textures": True,
                "texture_size": 2048
            }
        )
        return res.json()

    def show_model(self, task_id):
        res = self.client.get(
            url=f"{burl}/v1/generation-request/{task_id}/status/",
        )
        return res.json()

    def download_model(self, url: str, save_dir: str = "media/models/") -> str:
        parsed = urlparse(url)
        filename = Path(parsed.path).name  # trellis2_1024_1014963766.glb

        Path(save_dir).mkdir(parents=True, exist_ok=True)
        save_path = Path(save_dir) / filename

        # Стримим скачивание, чтобы не грузить весь файл в память разом
        # (не передаём auth-заголовки — presigned URL уже содержит подпись доступа)
        with stream("GET", url, timeout=Timeout(60.0)) as response:
            response.raise_for_status()
            with open(save_path, "wb") as f:
                for chunk in response.iter_bytes(chunk_size=8192):
                    f.write(chunk)

        return str(save_path)

api = API()