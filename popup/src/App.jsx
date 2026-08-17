import { useEffect, useState } from "react";

function App() {
  const [profile, setProfile] = useState({
    firstName: "Prajakta",
    lastName: "Sakhare",
    email: "prajakta@gmail.com",
    phone: "9876543210",
    address: "katraj",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411046",
    linkedin: "https://www.linkedin.com/in/prajakta-sakhare-b77b49220",
    github: "https://github.com/sakhareprajakta",
    experience: "2",
    noticePeriod: "Immediate",
  });




  useEffect(() => {
  const loadProfile = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/profile");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load profile");
      }

      console.log("REACT: Profile Loaded:", data);

      setProfile(data);
    } catch (error) {
      console.error("Profile Load Error:", error);
    }
  };

  loadProfile();
}, []);


  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

 const handleSave = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to save profile");
    }

    console.log("Profile Saved:", data.profile);
  } catch (error) {
    console.error("Profile Save Error:", error);
  }
};
  return (
    <div className="popup-container">
      <h1>Project Flow</h1>

      <p>Profile</p>

      <input
        name="firstName"
        value={profile.firstName}
        onChange={handleChange}
        placeholder="First Name"
      />

      <input
        name="lastName"
        value={profile.lastName}
        onChange={handleChange}
        placeholder="Last Name"
      />

      <input
        name="email"
        value={profile.email}
        onChange={handleChange}
        placeholder="Email"
      />

      <input
        name="phone"
        value={profile.phone}
        onChange={handleChange}
        placeholder="Phone"
      />

      <input
        name="city"
        value={profile.city}
        onChange={handleChange}
        placeholder="City"
      />

      <input
        name="state"
        value={profile.state}
        onChange={handleChange}
        placeholder="State"
      />

      <button onClick={handleSave}>
        Save Profile
      </button>
    </div>
  );
}

export default App;