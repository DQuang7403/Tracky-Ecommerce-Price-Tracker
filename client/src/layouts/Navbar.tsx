import { useEffect, useState } from "react";
import logo from "../assets/tracky-logo.png";
import SearchInput from "../components/SearchInput";
import { Button } from "../components/ui/button";
import {  User } from "lucide-react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { logOut, selectCurrentUser } from "../redux/slice/authSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
export default function Navbar() {
  const [searchBarOpen, setSearchBarOpen] = useState<boolean>(false);
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
  const currentUser = useAppSelector(selectCurrentUser);

  useEffect(() => {
    const handle = () => {
      if (window.innerWidth > 450) {
        setSearchBarOpen(false);
        setIsSmallScreen(false);
      } else {
        setIsSmallScreen(true);
      }
    };
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  });
  return (
    <section className="text-white h-16 flex justify-between items-center bg-[#014C86] px-4 sm:p-8 gap-2 z-[999] sticky">
      <Link
        to={"/"}
        className={`flex items-center gap-3 flex-shrink-0 relative ${
          searchBarOpen ? "hidden" : "flex"
        }`}
      >
        <img src={`${logo}`} className="h-10 aspect-square" />
        <h3 className=" text-xl font-semibold">Tracky</h3>
      </Link>
      {(!isSmallScreen || searchBarOpen) && (
        <SearchInput
          smallScreen={isSmallScreen}
          setSearchBarOpen={setSearchBarOpen}
          searchBarOpen={searchBarOpen}
        />
      )}
      <div
        className={`gap-2 ${searchBarOpen ? "hidden" : "flex"} items-center `}
      >
        {isSmallScreen && (
          <Button
            onClick={() => setSearchBarOpen((prev) => !prev)}
            variant={"ghost"}
            size={"icon"}
            className="bg-transparent rounded-full hover:bg-[#014478]"
          >
            <Search />
          </Button>
        )}
        {!currentUser ? (
          <Link to={"/authenticate"}>
            <Button>Log In</Button>
          </Link>
        ) : (
          <UtilsSection />
        )}
      </div>
    </section>
  );
}

const UtilsSection = () => {
  const dispatch = useAppDispatch();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"ghost"}
            size={"icon"}
            className="bg-transparent rounded-full hover:bg-[#0561a7] hover:text-white"
          >
            <User />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link className="w-full" to={"/profile"}>Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link className="w-full" to={"/tracked-products"}>Favorite</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => dispatch(logOut())} className="w-full">
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
