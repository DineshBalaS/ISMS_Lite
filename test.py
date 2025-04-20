import requests

url = "http://127.0.0.1:5000/submit"
response = requests.post(url, json={"name":'Dinesh'})
print(response.json())