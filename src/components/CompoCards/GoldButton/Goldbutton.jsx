import { Button } from "@material-tailwind/react";

export default function ButtonDefault({ btnname, onclick, bgcolor }) {
  return (
    <>
      <Button className={`rounded-full w-full normal-case font-thin shadow-md ${bgcolor} text-nowrap`} onClick={onclick}>{btnname}</Button>
    </>
  );
}
