import Image from "next/image";

const LogoIcon = () => {
  return (
    <div className="flex items-center gap-2">
      <Image src="/logo.png" alt="Enrica Ai" width={62} height={62} />
      <h3 className="text-2xl font-bold text-white">Enrica.AI</h3>
    </div>
  );
};

export default LogoIcon;
