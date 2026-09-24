import os
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
import flask
print("Flask successfully loaded:", flask.__version__)
try:
    import pandas as pd
    print("Pandas loaded:", pd.__version__)
except Exception as e:
    print("Pandas error:", e)

try:
    import joblib
    print("Joblib loaded:", joblib.__version__)
except Exception as e:
    print("Joblib error:", e)
