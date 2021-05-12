import { call } from "redux-saga/effects";
import { refreshToken } from "src/api";
import { getExpiredAt } from "src/helpers";
import { RefreshTokenError } from "src/models";
import { AuthEntities, httpService, storageService } from "src/services";

export function* refreshTokenSaga() {
  const tokenRefresh = yield call(
    [storageService, storageService.getFromStorage],
    AuthEntities.REFRESH_TOKEN
  ); // Get token from Async Storage(Secure Storage)

  const refreshExpireAt = yield call(
    [storageService, storageService.getFromStorage],
    AuthEntities.REFRESH_EXPIRED_AT
  ); // Get lifetime of token from Async Storage(Secure Storage)

  if (Number(refreshExpireAt) > new Date().valueOf()) {
    const response = yield call(refreshToken, { refresh: tokenRefresh }); // Send request for new token
    if (response.ok) {
      yield call(
        [storageService, storageService.saveToStorage],
        AuthEntities.ACCESS_EXPIRED_AT,
        getExpiredAt(response.data.access_lifetime)
      ); // Save lifetime of token to Async Storage(Secure Storage)

      yield call(
        [storageService, storageService.saveToStorage],
        AuthEntities.ACCESS_TOKEN,
        response.data.access
      ); // Save token to Async Storage(Secure Storage)

      yield call(
        [httpService, httpService.setAuthHeader],
        response.data.access
      ); // Set correct token for requests
    } else {
      throw new RefreshTokenError();
    }
  } else {
    throw new RefreshTokenError();
  }
}
