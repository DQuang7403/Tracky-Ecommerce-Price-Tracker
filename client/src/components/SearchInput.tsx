import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  placeholder?: string;
  smallScreen: boolean;
  searchBarOpen: boolean;
  setSearchBarOpen: (value: React.SetStateAction<boolean>) => void;
};
export default function SearchInput({
  placeholder,
  smallScreen,
  searchBarOpen,
  setSearchBarOpen,
}: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState<string>("");
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(search === "") return;
    navigate(`/search/${search}`);
  }
  return (
    <form onSubmit={onSubmit} className={`flex flex-grow max-w-[500px] w-full overflow-auto text-black`}>
      {smallScreen && searchBarOpen && (
        <Button
          type="button"
          onClick={() => setSearchBarOpen(false)}
          variant={"ghost"}
          size={"icon"}
          className="rounded-full bg-white px-3 mr-2"
        >
          <ArrowLeft />
          <span className="sr-only">Back Button</span>
        </Button>
      )}
      <Input
        type="search"
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder || "Search"}
        className="border-none rounded-r-none"
      ></Input>
      <Button
        type="submit"
        variant={"ghost"}
        size={"icon"}
        className="rounded-l-none bg-white w-16"
      >
        <Search />
        <span className="sr-only">Search Button</span>
      </Button>
    </form>
  );
}
