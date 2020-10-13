const deleteproduct = (event) => {
  const ProdId = event.previousElementSibling.getAttribute("value");
  const csrf = event.previousElementSibling.previousElementSibling.getAttribute(
    "value"
  );
  const parentElements = event.closest(".product-container");

  console.log(parentElements.parentElement);

  fetch("/admin/deleteproduct/" + ProdId, {
    method: "DELETE",
    headers: {
      "csrf-token": csrf,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      console.log(data);
      parentElements.parentElement.removeChild(parentElements);
    })
    .catch((err) => {
      console.log(err);
    });
};
