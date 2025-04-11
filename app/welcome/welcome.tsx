export function Welcome() {
  return (
    <main className="mx-32 pt-16 pb-4">
      <div className="navbar-logo">
        <div className="nama-perusahaan">
          <h3 className="text-2xl font-bold px-12">ZERO</h3>
        </div>
      </div>
      <div className=" px-auto mx-auto min-h-screen">
        <div className="hero items-center justify-center mt-12 ">
          <div className="kizaru flex  ">
            <div className="box-1 w-full px-12">
              <h1 className="title  text-7xl">Frontend Developer.</h1>
              <h3 className="mt-8 text-xl">
                I am a Frontend Developer with a passion for creating beautiful
                and user-friendly interfaces. I have experience in building
                responsive web applications using modern technologies such as
                React, Tailwind CSS, and TypeScript.
              </h3>
            </div>
            <div className="box-2 w-full justify-items-center">
              <div className="box-2 w-full justify-items-center">
                <img src={profileImage} alt="Profile" className="rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
        <div className="desc flex items-center justify-center text-white px-12">
          <div className="section flex w-full gap-x-8">
            <h3 className="mt-8 text-sm">
              I have experience in building responsive web applications using
              modern technologies such as React, Tailwind CSS, and TypeScript.
            </h3>
            <h3 className="mt-8 text-sm">
              I am always eager to learn new technologies and improve my skills.
              I am a team player and enjoy collaborating with others to create
              amazing products.
            </h3>
          </div>
          <div className="aowkoa w-full"></div>
        </div>
      </div>
    </main>
  );
}
import { useEffect } from "react";
import profileImage from "../assets/profile.jpg";
