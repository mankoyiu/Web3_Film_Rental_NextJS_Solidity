export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-4 text-center mt-8">
      <div>
        &copy; {new Date().getFullYear()} Film Rental Dapp. All rights reserved.
      </div>
      <div className="mt-2 text-xs">
        Powered by Next.js, wagmi, ethers.js, and Tailwind CSS.
      </div>
    </footer>
  );
}
