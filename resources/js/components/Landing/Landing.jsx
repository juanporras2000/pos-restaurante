import Caracteristicas from "./components/Caracteristicas"
import Footer from "./components/Footer"
import Hero from "./components/Hero"
import MetricasRentabilidad from "./components/MetricasRentabilidad"
import Navbar from "./components/Navbar"
import Planes from "./components/Planes"
import TiempoReal from "./components/TiempoReal"

export const Landing = () => {

  return (
    <div className="">
        <Navbar />

        <Hero />

        <Caracteristicas />

        <TiempoReal />

        <MetricasRentabilidad />

        <Planes />

        <Footer />
    </div>
  )
}


