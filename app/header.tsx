import Image from "next/image";
import logo from "@/public/logo.png";

export default function Header() {
  return (
    <div className="flex flex-col items-center">
      <a href="https://togetherai.link/?utm_source=loras-dev&utm_medium=referral&utm_campaign=example-app" target="_blank">
        <Image alt="" className="h-8 w-auto" src={logo} />
      </a>
      <p className="font-mono text-gray-600">Generate AI Images with LoRAs</p>
    </div>
  );
}
