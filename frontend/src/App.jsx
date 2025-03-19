import Footer from "./components/custom/Footer";
import Main from "./components/custom/Main";
import Service from "./components/custom/Service";
import Testimonials from "./components/custom/Testimonials";
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {/* <Main /> */}
      <Main />
      <Service/>
      <Testimonials/>
      <Footer/>
    </>
  )
}

