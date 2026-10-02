import React from 'react'

const LoginLeft = () => {
  return (
    <div className="hidden lg:flex lg:w-2/5 bg-[url('/bg-img.png')] bg-cover bg-center bg-no-repeat flex-col justify-between p-12 shrink-0 select-none">

      {/* Logo */}
      <div className="flex items-center gap-3">
        <img
          src="/logo.svg"
          alt="Logo"
          className="size-9"
        />

        <span className="text-4xl font-normal text-white tracking-tight">
          Builder AI
        </span>
      </div>

      {/* Bottom Content */}
      <div>
        <h2 className="text-[28px] text-white font-normal leading-snug mb-3 tracking-tight">
          Build your Presence on web
        </h2>

        <p className="text-zinc-300 text-[15px] leading-6 max-w-[500px]">
          Describe what you need, preview instantly, and customize your site
          in real-time. React with clean JSX, verified layouts, and instant
          code exports.
        </p>

        <p className="text-zinc-300 text-sm mt-12">
          Copyright {new Date().getFullYear()} Builder AI
        </p>
      </div>

    </div>
  )
}

export default LoginLeft