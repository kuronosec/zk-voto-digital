import { Dispatch, SetStateAction, FunctionComponent } from "react";

type RatingProps = {
  setRating: Dispatch<SetStateAction<string | undefined>>;
};

export const Ratings: FunctionComponent<RatingProps> = ({ setRating }) => {
  const ratings: number[] = [0, 1, 2, 3, 4, 5];

  return (
    <div className="flex flex-wrap">
      {ratings.map((rating) => (
        <div className="flex items-center mr-4" key={rating}>
          <input
            id={`rating-${rating}`}
            type="radio"
            value={`${rating}`}
            name="colored-radio"
            aria-describedby="helper-radio-text"
            className="w-4 h-4 border-[#FD8B0E] text-[#FD8B0E] border-2 checked:bg-[#FD8B0E] checked:ring-color-[#FD8B0E] focus:ring-offset-0 focus:ring-0"
            onClick={(e) => setRating((e.target as HTMLInputElement).value)}
          />
          <label
            htmlFor={`rating-${rating}`}
            className="ml-2 text-md text-black font-rajdhani font-medium"
          >
            {rating}
          </label>
        </div>
      ))}
    </div>
  );
};
