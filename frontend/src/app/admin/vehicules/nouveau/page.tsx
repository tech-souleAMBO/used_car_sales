import { VehicleForm } from '@/components/VehicleForm';

export default function NewVehiclePage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Ajouter un véhicule</h1>
      <div className="mt-6">
        <VehicleForm />
      </div>
    </div>
  );
}
