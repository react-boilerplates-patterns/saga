import { call, put } from "redux-saga/effects";
import { AuthEntities, httpService, storageService } from "src/services";
import { AccessTokenError } from "./models";
import { authActions } from "src/redux/auth/actions";
import { refreshTokenSaga } from "./refresh-token-saga";

export function* authenticateSaga(successCallbackFn, successCallbackFnParams) {
  try {
    const tokenAccess = yield call(
      [storageService, storageService.getFromStorage],
      AuthEntities.ACCESS_TOKEN
    );
    if (tokenAccess) {
      const accessExpireAt = yield call(
        [storageService, storageService.getFromStorage],
        AuthEntities.ACCESS_EXPIRED_AT
      );
      if (Number(accessExpireAt) > new Date().valueOf()) {
        yield call([httpService, httpService.setAuthHeader], tokenAccess);
      } else {
        yield call(refreshTokenSaga);
      }
      if (successCallbackFn) {
        yield call(successCallbackFn, successCallbackFnParams);
      }
    } else {
      yield put(authActions.logOut());
      throw new AccessTokenError();
    }
  } catch (_) {
    yield put(authActions.logOut());
    throw new AccessTokenError();
  }
}
