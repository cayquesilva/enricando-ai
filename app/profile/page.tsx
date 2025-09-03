import Navbar from "../_components/navbar";
import { requireAuth } from "../_lib/auth";
import ProfileForm from "./_components/profile-form";

const ProfilePage = async () => {
  // Garante que apenas utilizadores autenticados podem aceder a esta página
  const user = await requireAuth();

  return (
    <div className="flex h-screen flex-col">
      <Navbar
        user={{
          name: user.name,
          isPremium: user.isPremium,
          isAdmin: user.isAdmin,
        }}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-6 text-2xl font-bold">O Meu Perfil</h1>
          <ProfileForm user={user} />
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
