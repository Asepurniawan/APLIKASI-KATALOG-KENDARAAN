update public.vehicles
set image_url = (
  case
    when vehicle_type = 'Motor' then
      case lower(brand)
        when 'honda' then 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=85&vehicle=motor'
        when 'yamaha' then 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=85&vehicle=motor'
        when 'kawasaki' then 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85&vehicle=motor'
        when 'vespa' then 'https://images.unsplash.com/photo-1524591652733-73fa1ae7ec1f?auto=format&fit=crop&w=1200&q=85&vehicle=motor'
        else 'https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&w=1200&q=85&vehicle=motor'
      end
    else
      case lower(brand)
        when 'honda' then 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85&vehicle=car'
        when 'toyota' then 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=85&vehicle=car'
        when 'mitsubishi' then 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=85&vehicle=car'
        when 'bmw' then 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=85&vehicle=car'
        when 'yamaha' then 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&w=1200&q=85&vehicle=car'
        else 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85&vehicle=car'
      end
  end
);

select count(*) as updated_vehicle_rows
from public.vehicles
where image_url like 'https://images.unsplash.com/%';
