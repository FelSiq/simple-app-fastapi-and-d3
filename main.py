import os

import fastapi
import fastapi.middleware.cors
import pandas as pd
import sklearn.cluster


app = fastapi.FastAPI()

origins = ["*"]

app.add_middleware(
    fastapi.middleware.cors.CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/data/{dataset_name}")
async def get_data(dataset_name: str):
    dataset_uri = os.path.abspath(f"./d3test/data/{dataset_name}.csv")
    df = pd.read_csv(dataset_uri, sep=",")
    min_, max_ = df.quantile((0, 1), axis=0).values.tolist()
    return {"data": df.values.tolist(), "range_max": max_, "range_min": min_}


@app.get("/k-means/{dataset_name}")
async def get_data(dataset_name: str, k: int = 3):
    dataset_uri = os.path.abspath(f"./d3test/data/{dataset_name}.csv")
    df = pd.read_csv(dataset_uri, sep=",")
    clusterer = sklearn.cluster.KMeans(
        n_clusters=k,
        init="k-means++",
        n_init="auto",
        random_state=16,
        copy_x=False,
    )
    cluster_ids = clusterer.fit_predict(df)
    cluster_ids = cluster_ids.ravel().tolist()
    return {"cluster_ids": cluster_ids}
