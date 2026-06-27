from fastapi import HTTPException


def raise_bad_request(error: ValueError):
    raise HTTPException(status_code=400, detail=str(error))
