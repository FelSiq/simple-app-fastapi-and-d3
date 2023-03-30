import os

import fastapi
import fastapi.middleware.cors
import numpy as np
import pandas as pd
import sklearn.cluster
import scipy.spatial
import scipy.sparse.csgraph
import pydantic


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


class KMeansDataPack(pydantic.BaseModel):
    data: list[tuple[float, float]]
    k: int = 3


@app.post("/k-means")
async def get_data(data_pack: KMeansDataPack):
    k = data_pack.k
    data = np.asfarray(data_pack.data)

    clusterer = sklearn.cluster.KMeans(
        n_clusters=k,
        init="k-means++",
        n_init="auto",
        random_state=16,
    )

    cluster_ids = clusterer.fit_predict(data)
    cluster_ids = cluster_ids.astype(int, copy=False)
    cluster_ids = cluster_ids.ravel().tolist()

    ids = np.unique(cluster_ids)

    mst = []

    for i in ids:
        cls_inds = np.flatnonzero(cluster_ids == i)

        if cls_inds.size <= 1:
            continue

        subset = data[cls_inds, :]

        dist_mat = scipy.spatial.distance.cdist(subset, subset)
        span_tree = scipy.sparse.csgraph.minimum_spanning_tree(dist_mat, overwrite=True)
        ids_a, ids_b, weights = scipy.sparse.find(span_tree)

        mst.extend(zip(cls_inds[ids_a], cls_inds[ids_b], weights))

    mst = [(int(ia), int(ib), float(w)) for ia, ib, w in mst]

    return {"cluster_ids": cluster_ids, "mst": mst}
