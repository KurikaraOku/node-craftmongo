const getSupplies = () => {
    const inputs = document.querySelectorAll("#supply-boxes input");
    const supplies = [];
    inputs.forEach((input) => {
      supplies.push(input.value);
    });
    return supplies;
  };
  
  const populateEditForm = (craft) => {
    console.log("Craft Object:", craft); 
    const form = document.getElementById("add-edit-craft-form");
    form._id.value = craft._id || "";
    form.name.value = craft.name;
    form.description.value = craft.description;
    document.getElementById("img-prev").src = craft.image ? "/crafts/" + craft.image : "";

    // Clear existing supply boxes
    const supplyBoxes = document.getElementById("supply-boxes");
    supplyBoxes.innerHTML = "";

    // Create input boxes for each supply and populate them
    craft.supplies.forEach((supply) => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = supply;
        supplyBoxes.appendChild(input);
    });
};


  const showCrafts = async () => {
    try {
      const response = await fetch("/api/crafts");
      const crafts = await response.json();
      const craftDiv = document.getElementById("craft-list");
      craftDiv.classList.add("flex-container");
  
      crafts.forEach((craft) => {
        const section = document.createElement("section");
        section.classList.add("flex-item");
  
        const img = document.createElement("img");
        img.src = craft.image ? "/crafts/" + craft.image : "";
        img.classList.add("insertedImage");
  
        img.addEventListener("click", () => {
          const modal = document.getElementById("myModal");
          const modalTitle = modal.querySelector("#modal-title");
          const modalImg = modal.querySelector("#modal-img");
          const modalDescription = modal.querySelector("#modal-description");
          const modalSupplies = modal.querySelector("#modal-supplies");
  
          modalTitle.textContent = craft.name;
          modalImg.src = img.src;
          modalDescription.textContent = craft.description;
  
          const eLink = document.createElement("a");
          eLink.innerHTML = "&#9998;";
          eLink.id = "edit-link";
          eLink.addEventListener("click", (event) => {
            event.preventDefault();
            populateEditForm(craft);
            document.getElementById("add-craft-modal").style.display = "block"; // Display the edit modal
          });
          modalTitle.appendChild(eLink);
  
          const dLink = document.createElement("a");
          dLink.innerHTML = " &#120143;";
          modalTitle.append(dLink);
          dLink.id = "delete-link";
          dLink.onclick = deleteCraft.bind(this, craft);

          modalSupplies.innerHTML = "";
          craft.supplies.forEach((supply) => {
            const li = document.createElement("li");
            li.textContent = supply;
            modalSupplies.appendChild(li);
          });
  
          modal.style.display = "block";
        });
  
        section.appendChild(img);
        craftDiv.appendChild(section);
      });
    } catch (error) {
      console.error("Error fetching crafts:", error);
    }
  };
  
  const deleteCraft = async (craft) => {
    const confirmed = confirm("Are you sure you want to delete this craft?");
    if (confirmed) {
        let response = await fetch(`/api/crafts/${craft._id}`, {
            method: "DELETE",
        });

        if (response.status != 200) {
            console.log("Error deleting");
            return;
        }

        let result = await response.json();
        document.getElementById("add-craft-modal").style.display = "none";
        resetForm();
        location.reload();
    }
};

  const addCraft = async (e) => {
    e.preventDefault();
    const form = document.getElementById("add-edit-craft-form");
    const formData = new FormData(form);
    formData.append("supplies", getSupplies());
    let response;

    const craftId = form.querySelector('input[name="_id"]').value; 

    if (!craftId || craftId == "-1") {
        response = await fetch("/api/crafts", {
            method: "POST",
            body: formData,
        });
    } else {
        response = await fetch(`/api/crafts/${craftId}`, { 
            method: "PUT",
            body: formData,
        });
    }

    if (response.status != 200) {
        console.log("Error contacting API server");
        return;
        
    }

    const craft = await response.json(); 



    document.getElementById("add-craft-modal").style.display = "none";
    resetForm();
    location.reload();
    
};


  
  const resetForm = () => {
    const form = document.getElementById("add-edit-craft-form");
    form.reset();
    form._id = "-1";
    document.getElementById("supply-boxes").innerHTML = "";
    document.getElementById("img").value = "";
    document.getElementById("img-prev").src = "";
  };
  
  const addSupply = (e) => {
    e.preventDefault();
    console.log("add a supply")
    const supplyBoxes = document.getElementById("supply-boxes");
    const input = document.createElement("input");
    input.type = "text";
    supplyBoxes.append(input);
    document.body.classList.add("show-overlay");
  };
  
  window.onload = () => {
    const modals = document.querySelectorAll(".modal");
    const closeButtons = document.querySelectorAll(".close");
    const addLink = document.getElementById("add-link");
    const addModal = document.getElementById("add-craft-modal");
    const cancelButton = document.getElementById("cancel");
    const addCraftForm = document.getElementById("add-edit-craft-form");
  
    closeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        modals.forEach((modal) => {
          modal.style.display = "none";
          if (modal === addModal) {
            resetForm();
            document.body.classList.remove("show-overlay");
          }
        });
      });
    });
  
    window.addEventListener("click", (event) => {
      modals.forEach((modal) => {
        if (event.target === modal) {
          modal.style.display = "none";
          if (modal === addModal) {
            resetForm();
          }
        }
      });
    });
  
    addLink.addEventListener("click", (event) => {
      event.preventDefault();
      addModal.style.display = "block";
    });
  
    cancelButton.addEventListener("click", (event) => {
      event.preventDefault();
      addModal.style.display = "none";
      resetForm();
    });
  
    document.getElementById("add-supply").onclick = addSupply;
  
    document.getElementById("img").onchange = (e) => {
      if (!e.target.files.length) {
        document.getElementById("img-prev").src = "";
        return;
      }
      document.getElementById("img-prev").src = URL.createObjectURL(
        e.target.files.item(0)
      );
    };
  
    addCraftForm.addEventListener("submit", addCraft);
  
    showCrafts();
  };