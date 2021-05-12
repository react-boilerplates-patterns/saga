import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { call, put } from "redux-saga/effects";
import { authenticateSaga } from "./authenticate-saga";

//TODO types in action creators, use "Generic"
export function* makeRequestSaga(
  successActionCreator: ActionCreatorWithPayload<any, any>,
  failureActionCreator: ActionCreatorWithPayload<any, any>,
  apiFn: () => void,
  apiFnParams = {},
  meta: any,
  withAuthentication = true
) {
  try {
    if (withAuthentication) {
      yield call(authenticateSaga);
    }

    const response = yield call(apiFn, apiFnParams);

    if (response.ok) {
      yield put(successActionCreator(response.data, meta));
    } else {
      yield put(failureActionCreator(response));
    }
  } catch (error) {
    yield put(failureActionCreator(error));
  }
}
