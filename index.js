import express from "express";
import morgan from "morgan";
import cors from "cors";
import "./database/database.js"
import Card from "./database/Card.js";

const app = express();

// Server config
app.use(morgan("dev"));
app.use(cors());

export default app;

// Test cards
/*(() => {
  Card.insertMany([
    {
      code: '1A',
      name: 'Toyota Corolla',
      cylinder: 1200,
      cylinders: 8,
      horsepower: 900,
      revolutions: 12000,
      weight: 800
    },
    {
      code: '2A',
      name: 'Honda Civic',
      cylinder: 1500,
      cylinders: 6,
      horsepower: 1000,
      revolutions: 16000,
      weight: 700
    },
    {
      code: '3A',
      name: 'Ford Mustang',
      cylinder: 1400,
      cylinders: 10,
      horsepower: 1100,
      revolutions: 15000,
      weight: 900
    },
    {
      code: '4A',
      name: 'Chevrolet Camaro',
      cylinder: 1300,
      cylinders: 12,
      horsepower: 800,
      revolutions: 13000,
      weight: 600
    },
    {
      code: '1B',
      name: 'BMW M3',
      cylinder: 1100,
      cylinders: 8,
      horsepower: 700,
      revolutions: 11000,
      weight: 950
    },
    {
      code: '2B',
      name: 'Mercedes-Benz C-Class',
      cylinder: 1600,
      cylinders: 6,
      horsepower: 1200,
      revolutions: 17000,
      weight: 850
    },
    {
      code: '3B',
      name: 'Audi A4',
      cylinder: 1500,
      cylinders: 8,
      horsepower: 1000,
      revolutions: 16000,
      weight: 750
    },
    {
      code: '4B',
      name: 'Volkswagen Golf',
      cylinder: 1200,
      cylinders: 10,
      horsepower: 950,
      revolutions: 14000,
      weight: 550
    },
    {
      code: '1C',
      name: 'Subaru Impreza',
      cylinder: 1400,
      cylinders: 8,
      horsepower: 1050,
      revolutions: 15000,
      weight: 950
    },
    {
      code: '2C',
      name: 'Mazda 3',
      cylinder: 1300,
      cylinders: 6,
      horsepower: 850,
      revolutions: 12000,
      weight: 600
    },
    {
      code: '3C',
      name: 'Lexus RX',
      cylinder: 1300,
      cylinders: 10,
      horsepower: 950,
      revolutions: 14000,
      weight: 900
    },
    {
      code: '4C',
      name: 'Volvo XC60',
      cylinder: 1500,
      cylinders: 8,
      horsepower: 1100,
      revolutions: 16000,
      weight: 1000
    },
    {
      code: '1D',
      name: 'Tesla Model S',
      cylinder: 0,
      cylinders: 0,
      horsepower: 1000,
      revolutions: 18000,
      weight: 700
    },
    {
      code: '2D',
      name: 'Jeep Wrangler',
      cylinder: 1400,
      cylinders: 6,
      horsepower: 900,
      revolutions: 12000,
      weight: 800
    },
    {
      code: '3D',
      name: 'Nissan Altima',
      cylinder: 1200,
      cylinders: 12,
      horsepower: 800,
      revolutions: 13000,
      weight: 600
    },
    {
      code: '4D',
      name: 'Hyundai Sonata',
      cylinder: 1100,
      cylinders: 8,
      horsepower: 750,
      revolutions: 11000,
      weight: 950
    },
    {
      code: '1E',
      name: 'Kia Sportage',
      cylinder: 1400,
      cylinders: 6,
      horsepower: 950,
      revolutions: 14000,
      weight: 750
    },
    {
      code: '2E',
      name: 'Mitsubishi Outlander',
      cylinder: 1300,
      cylinders: 10,
      horsepower: 1050,
      revolutions: 15000,
      weight: 900
    },
    {
      code: '3E',
      name: 'Acura MDX',
      cylinder: 1500,
      cylinders: 8,
      horsepower: 1000,
      revolutions: 16000,
      weight: 800
    },
    {
      code: '4E',
      name: 'Land Rover Discovery',
      cylinder: 1600,
      cylinders: 6,
      horsepower: 1200,
      revolutions: 17000,
      weight: 850
    },
    {
      code: '1F',
      name: 'Chevrolet Silverado',
      cylinder: 1600,
      cylinders: 8,
      horsepower: 1100,
      revolutions: 15000,
      weight: 900
    },
    {
      code: '2F',
      name: 'GMC Sierra',
      cylinder: 1500,
      cylinders: 6,
      horsepower: 900,
      revolutions: 12000,
      weight: 800
    },
    {
      code: '3F',
      name: 'Ram 1500',
      cylinder: 1400,
      cylinders: 12,
      horsepower: 800,
      revolutions: 13000,
      weight: 600
    },
    {
      code: '4F',
      name: 'Ford F-150',
      cylinder: 1300,
      cylinders: 8,
      horsepower: 750,
      revolutions: 11000,
      weight: 950
    },
    {
      code: '1G',
      name: 'Toyota Tacoma',
      cylinder: 1400,
      cylinders: 6,
      horsepower: 950,
      revolutions: 14000,
      weight: 750
    },
    {
      code: '2G',
      name: 'Nissan Frontier',
      cylinder: 1300,
      cylinders: 10,
      horsepower: 1050,
      revolutions: 15000,
      weight: 900
    },
    {
      code: '3G',
      name: 'Chevrolet Colorado',
      cylinder: 1500,
      cylinders: 8,
      horsepower: 1000,
      revolutions: 16000,
      weight: 800
    },
    {
      code: '4G',
      name: 'Ford Ranger',
      cylinder: 1600,
      cylinders: 6,
      horsepower: 1200,
      revolutions: 17000,
      weight: 850
    },
    {
      code: '1H',
      name: 'Honda CR-V',
      cylinder: 1300,
      cylinders: 8,
      horsepower: 900,
      revolutions: 12000,
      weight: 800
    },
    {
      code: '2H',
      name: 'Toyota RAV4',
      cylinder: 1400,
      cylinders: 6,
      horsepower: 950,
      revolutions: 14000,
      weight: 750
    },
    {
      code: '3H',
      name: 'Jeep Grand Cherokee',
      cylinder: 1500,
      cylinders: 12,
      horsepower: 800,
      revolutions: 13000,
      weight: 600
    },
    {
      code: '4H',
      name: 'Ford Explorer',
      cylinder: 1600,
      cylinders: 8,
      horsepower: 1100,
      revolutions: 15000,
      weight: 900
    }
  ])
})()*/
