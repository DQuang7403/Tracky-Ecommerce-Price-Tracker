import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectCurrentUser, updateUserInfo } from "../redux/slice/authSlice";
import dateFormatter from "../utils/dateFormatter";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { BookmarkPlus, FolderPen, Mail } from "lucide-react";
import { useState } from "react";
import { useUpdateUserMutation } from "../redux/slice/userApiSlice";
import { toast } from "../components/ui/use-toast";
import FrequencyUpdate from "../layouts/FrequencyUpdate";
import personalSite from "../assets/personal_site.svg";
type InfoType = {
  name: string;
  email: string;
  oldPassword: string;
  newPassword: string;
  receiveGmail: boolean;
};
type AutoUpdateConfigType = {
  frequency: string;
  hour: string;
  minute: string;
  day: string;
};
export default function ProfilePage() {
  const currentUser = useAppSelector(selectCurrentUser);
  const [updateUser] = useUpdateUserMutation();
  const dispatch = useAppDispatch();
  const [info, setInfo] = useState<InfoType>({
    name: currentUser?.name,
    email: currentUser?.email,
    oldPassword: "",
    newPassword: "",
    receiveGmail: currentUser?.receiveGmail,
  });
  const [autoUpdateConfig, setAutoUpdateConfig] =
    useState<AutoUpdateConfigType>({
      frequency: currentUser?.autoUpdateConfig?.frequency,
      hour: currentUser?.autoUpdateConfig?.hour,
      minute: currentUser?.autoUpdateConfig?.minute,
      day: currentUser?.autoUpdateConfig?.day,
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await updateUser({ ...info, ...autoUpdateConfig });

    if (res?.data?.msg === "Update successfully") {
      toast({
        title: "Success",
        description: res.data.msg,
        variant: "success",
      });
      dispatch(updateUserInfo(res.data.user_info));
      setInfo({
        name: res.data.user_info.name,
        email: res.data.user_info.email,
        oldPassword: "",
        newPassword: "",
        receiveGmail: res.data.user_info.receiveGmail,
      });
    } else if (res?.error) {
      toast({
        title: "Error",
        description: res.error.data,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "default",
      });
    }
  };
  return (
    <section className="sm:px-20 sm:py-10 sm:bg-gradient-to-tr sm:from-[#e2e2e2] sm:to-[#c9d6ff] h-[calc(100vh-64px)] overflow-hidden bg-white">
      <div className=" grid bg-white h-full rounded-lg shadow-sm lg:grid-cols-[auto,1fr] grid-cols-1 flex-grow-1 overflow-auto">
        <div className="bg-[#5569BC] w-[350px] lg:flex hidden justify-center flex-col items-center p-4 text-white ">
          <img
            src={personalSite}
            alt="profile"
            className="aspect-square w-full object-fit"
          />
          <article className="mt-4 text-lg">
            <h2 className="flex gap-2 text-md font-semibold items-center">
              <FolderPen className="w-4 h-4 text-yellow-400" />
              Name: {currentUser?.name}
            </h2>
            <h2 className="flex gap-2 text-md font-semibold items-center">
              <Mail className="w-4 h-4 text-green-400" />
              Email: {currentUser?.email}
            </h2>
            <h2 className="flex gap-2 text-md font-semibold items-center">
              <BookmarkPlus className="w-4 h-4 text-red-400" />
              Member since {dateFormatter(currentUser?.createdAt)}
            </h2>
          </article>
        </div>
        <div className="w-full flex justify-center flex-col items-center p-4 ">
          <form
            onSubmit={(e) => handleSubmit(e)}
            className="w-full font-semibold"
          >
            <label htmlFor="name">Name: </label>
            <Input
              id="name"
              defaultValue={info?.name}
              className="mb-2 mt-1 font-normal"
              onChange={(e) => setInfo({ ...info, name: e.target.value })}
            />
            <label htmlFor="email">Email: </label>
            <Input
              id="email"
              defaultValue={info?.email}
              className="mb-2 mt-1 font-normal"
              onChange={(e) => setInfo({ ...info, email: e.target.value })}
            />
            <div className="flex flex-col sm:flex-row sm:my-4 sm:gap-4">
              <label htmlFor="oldPassword">Current Password: </label>
              <Input
                id="oldPassword"
                onChange={(e) =>
                  setInfo({ ...info, oldPassword: e.target.value })
                }
                className="mb-2 mt-1 font-normal"
              />
              <label htmlFor="password">New Password: </label>
              <Input
                id="password"
                className="mb-2 mt-1 font-normal"
                onChange={(e) =>
                  setInfo({ ...info, newPassword: e.target.value })
                }
              />
            </div>
            <div>
              <input
                type="checkbox"
                defaultChecked={info?.receiveGmail}
                id="receive"
                onChange={() =>
                  setInfo({ ...info, receiveGmail: !info.receiveGmail })
                }
              />
              <label htmlFor="receive">Receive notifications</label>
            </div>

            <FrequencyUpdate
              autoUpdateConfig={autoUpdateConfig}
              setAutoUpdateConfig={setAutoUpdateConfig}
            />

            <Button className="mt-4 justify-self-end">Update</Button>
          </form>
        </div>
      </div>
    </section>
  );
}
