export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50">
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-sahara-red/30 animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 rounded-full border-4 border-t-chefchaouen-blue animate-spin [animation-duration:0.6s]"></div>
          </div>
          <div className="relative">
            <p className="text-xl font-semibold bg-gradient-to-r from-sahara-red to-chefchaouen-blue bg-clip-text text-transparent">
              Loading...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}