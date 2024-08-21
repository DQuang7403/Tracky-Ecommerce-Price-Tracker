import Notfound from "../assets/not_found.svg";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
export default function PageNotFound() {
  return (
    <section className="h-[calc(100vh-64px)] w-full px-4 sm:pl-20 mb-4 flex items-center justify-center">
      <div className="w-[300px] aspect-square flex flex-col items-center justify-center">
        <img src={Notfound} alt="" loading="lazy" />
        <h2 className="text-xl font-semibold mt-4">404 Page not found</h2>
        <Link to="/" className="mt-4">
          <Button>Go Home</Button>
        </Link>
      </div>
    </section>
  );
}
