# D3 Demo

## Resources
- [Backend: FastAPI](https://fastapi.tiangolo.com/)
- [Frontend: D3](https://d3js.org/)

## Other useful links
- [Older Random Forest visualization tool (Nyata)](https://github.com/FelSiq/nyata-random-forest-visualization)
- [Our Python Dev Guide](https://www.overleaf.com/read/ffwksqdxmfkx)

## Install
- Always develop within a virtual environment, preventing dependency version conflicts:
```bash
python -m venv venv
source venv/bin/activate
```

- Make sure your PIP version is updated within the virtual environment:
```bash
python -m pip install -U pip
```

- While developing, install your package in `editable` mode; this enable testing tools fetching the latest version of source your code:
```bash
python -m pip install -e "."
```

## Run
```bash
python -m uvicorn main:app --reload
```
