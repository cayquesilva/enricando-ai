import Image from "next/image";

const LogoIcon = () => {
  return (
    <div className="flex items-center gap-2">
      <Image src="logo.svg" alt="Enrica Ai" width={39} height={39} />
      <h3 className="text-2xl font-bold text-white">Enrica.AI</h3>
    </div>
  );
};

export default LogoIcon;
