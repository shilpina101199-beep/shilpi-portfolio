import { lazy, Suspense } from "react";
import "./App.css";
import ErrorBoundary from "./components/ErrorBoundary";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
import { LoadingProvider } from "./context/LoadingProvider";

const App = () => {
  return (
    <>
      <ErrorBoundary>
        <LoadingProvider>
          <Suspense fallback={null}>
            <MainContainer>
              <Suspense fallback={null}>
                <CharacterModel />
              </Suspense>
            </MainContainer>
          </Suspense>
        </LoadingProvider>
      </ErrorBoundary>
    </>
  );
};

export default App;
