import Navbar from "./layouts/Navbar";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Product from "./pages/Product";
import Auth from "./layouts/Auth";
import RequireAuth from "./redux/api/RequireAuth";
import { Toaster } from "./components/ui/toaster";
import TrackedProducts from "./pages/TrackedProducts";
import SearchResutls from "./pages/SearchResutls";
import ProfilePage from "./pages/ProfilePage";
import PageNotFound from "./pages/PageNotFound";
function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/product/:name" element={<Product />}></Route>
        <Route path="/authenticate" element={<Auth />}></Route>
        <Route path="/search/:searchParams" element={<SearchResutls />}></Route>

        {/* Protected Routes */}
        <Route element={<RequireAuth />}>
          <Route path="/profile" element={<ProfilePage />}></Route>
          <Route path="/tracked-products" element={<TrackedProducts />}></Route>
        </Route>
        <Route path="*" element={<PageNotFound />}></Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
