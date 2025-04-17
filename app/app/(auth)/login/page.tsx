import Image from "next/image";
import LoginButton from "./login-button";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="mx-5 border border-indigo-500/30 py-10 sm:mx-auto sm:w-full sm:max-w-md sm:rounded-lg sm:shadow-md bg-black/40 backdrop-blur-sm">
      <Image
        alt="CogniDAO"
        width={120}
        height={120}
        className="relative mx-auto h-64 w-auto"
        src="/CogniBrainTransparent.png"
      />
      <h1 className="mt-6 text-center font-cal text-3xl text-white">
        Login
      </h1>
      <p className="mt-2 text-center text-sm text-indigo-200">
        Join the community of world builders. <br />
      </p>

      <div className="mx-auto mt-4 w-11/12 max-w-xs sm:w-full">
        <Suspense
          fallback={
            <div className="my-2 h-10 w-full rounded-md border border-indigo-500/30 bg-indigo-900/20" />
          }
        >
          <LoginButton />
        </Suspense>
      </div>
    </div>
  );
}
