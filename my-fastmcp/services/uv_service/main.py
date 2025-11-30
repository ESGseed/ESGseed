import requests


def main():
    print("Hello from uv-service!")
    
    resp = requests.get("https://httpbin.org/get", params={"q": "test"})
    resp.raise_for_status()
    print(resp.json())


if __name__ == "__main__":
    main()
