import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  day_selection,
  hour_selection,
  min_selection,
} from "../utils/constants";
type FrequencyUpdateProps = {
  autoUpdateConfig: {
    frequency: string;
    hour: string;
    minute: string;
    day: string;
  };
  setAutoUpdateConfig: (autoUpdateConfig: any) => void;
};

export default function FrequencyUpdate({
  autoUpdateConfig,
  setAutoUpdateConfig,
}: FrequencyUpdateProps) {
  
  return (
    <div className="border-t mt-2">
      <hr />
      <div className="flex items-center gap-10 my-2 ">
        <h2 className="text-xl text-gray-500">Update frequency</h2>
        <TimeToUpdate
          frequency={autoUpdateConfig.frequency}
          hour={autoUpdateConfig.hour}
          minute={autoUpdateConfig.minute}
          day={autoUpdateConfig.day}
        />
      </div>
      <div className="flex items-center gap-10 flex-wrap">
        <label htmlFor="Select_frequency">
          Select frequency
          <Select
            defaultValue={`${autoUpdateConfig.frequency}`}
            onValueChange={(e) =>
              setAutoUpdateConfig({ ...autoUpdateConfig, frequency: e })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Hourly">Hourly</SelectItem>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </label>
        {autoUpdateConfig.frequency !== "Hourly" && (
          <label htmlFor="Select_hour">
            Select hour
            <Select
              defaultValue={`${autoUpdateConfig.hour}`}
              onValueChange={(e) =>
                setAutoUpdateConfig({ ...autoUpdateConfig, hour: e })
              }
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="Select hour" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={`00`}>00</SelectItem>
                  {hour_selection.map((i) => (
                    <SelectItem key={i} value={`${i}`}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </label>
        )}
        <label htmlFor="Select_min">
          Select minute
          <Select
            defaultValue={`${autoUpdateConfig.minute}`}
            onValueChange={(e) =>
              setAutoUpdateConfig({ ...autoUpdateConfig, minute: e })
            }
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Select minute" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={`00`}>00</SelectItem>
                {min_selection.map((i) => (
                  <SelectItem key={i} value={`${i}`}>
                    {i}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </label>
        {autoUpdateConfig.frequency === "Weekly" && (
          <label htmlFor="Select_day">
            Select day
            <Select
              defaultValue={`${autoUpdateConfig.day}`}
              onValueChange={(e) =>
                setAutoUpdateConfig({ ...autoUpdateConfig, day: e })
              }
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="Select minute" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {day_selection.map((i) => (
                    <SelectItem key={i} value={`${i}`}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </label>
        )}
      </div>
    </div>
  );
}

type TimeToUpdateProps = {
  frequency: string;
  hour: string;
  minute: string;
  day: string;
};

const TimeToUpdate = ({ frequency, hour, minute, day }: TimeToUpdateProps) => {
  let content = ``;
  let base = `We will update `;
  if (frequency === "Hourly") {
    content = `${base} at minute ${minute} ${frequency}`;
  } else if (frequency === "Daily") {
    content = `${base} at ${hour}:${minute} ${frequency}`;
  } else if (frequency === "Weekly") {
    content = `${base} on ${day} at ${hour}:${minute} ${frequency}`;
  }
  return <h3 className="text-gray-500">{content}</h3>;
};
