import { configureStore, combineReducers, type Middleware } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer, { logout } from "@/features/auth/model/authSlice";
import notificationsReducer from "@/features/notifications/model/notificationsSlice";
import uiReducer from "@/features/ui-state/model/uiSlice";
import { api } from "@/shared/api/baseApi";

const rootReducer = combineReducers({
  auth: authReducer,
  notifications: notificationsReducer,
  ui: uiReducer,
  [api.reducerPath]: api.reducer,
});

const clearApiCacheOnLogout: Middleware = (storeApi) => (next) => (action) => {
  const result = next(action);
  if (logout.match(action)) storeApi.dispatch(api.util.resetApiState());
  return result;
};

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(clearApiCacheOnLogout, api.middleware),
    preloadedState,
  });
}

export const store = setupStore();
setupListeners(store.dispatch);
export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
