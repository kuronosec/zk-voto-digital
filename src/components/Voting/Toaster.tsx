/* eslint-disable react-hooks/exhaustive-deps */
import { Dispatch, FunctionComponent, SetStateAction } from "react";

type ToasterProps = {
  isDisplayed: boolean;
  setIsDisplayed: Dispatch<SetStateAction<boolean>>;
};

export const Toaster: FunctionComponent<ToasterProps> = ({
  isDisplayed,
  setIsDisplayed,
}) => {
  if (!isDisplayed) return null;

  return (
    <div className="fixed bottom-24 left-0 right-0 flex justify-center items-center h-20 bg-[#009A08] z-50">
      <p className="font-rajdhani font-medium text-white">
        {"You have successfully voted!".toUpperCase()}
      </p>
      <button
        className="absolute right-4 text-white"
        onClick={() => setIsDisplayed(false)}
      >
        X
      </button>
    </div>
  );
};
