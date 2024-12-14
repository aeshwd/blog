document.addEventListener("DOMContentLoaded", () => {
    let blogs = JSON.parse(localStorage.getItem("blogs")) || [];

    // Function to check available storage space and manage it
    const manageStorage = (newData) => {
        const serializedData = JSON.stringify([...blogs, newData]);
        const dataSize = new Blob([serializedData]).size;
        const storageLimit = 40 * 1024 * 1024; // 40 MB

        if (dataSize > storageLimit) {
            // Remove the oldest blog to make space
            blogs.shift();
        }
        return dataSize <= storageLimit;
    };

    // Handle blog submission (accessible only to admin)
    const submitBlogButton = document.getElementById("submit-blog");
    if (submitBlogButton) {
        submitBlogButton.addEventListener("click", () => {
            const title = document.getElementById("title").value;
            const imageInput = document.getElementById("image");
            const description = document.getElementById("description").value;
            const author = document.getElementById("author").value;
            const datetime = document.getElementById("datetime").value;

            if (title && imageInput.files.length && description && author && datetime) {
                const reader = new FileReader();
                reader.onload = () => {
                    const newBlog = {
                        title,
                        imageUrl: reader.result, // Save image as base64
                        description,
                        author,
                        datetime,
                    };
                    // Check if adding this new blog exceeds the storage limit
                    if (manageStorage(newBlog)) {
                        blogs.push(newBlog);
                        localStorage.setItem("blogs", JSON.stringify(blogs));
                        alert("Blog submitted successfully!");
                        document.getElementById("blog-form").reset();
                    } else {
                        alert("Storage limit exceeded! Please delete some blogs first.");
                    }
                };
                reader.readAsDataURL(imageInput.files[0]); // Convert file to base64
            } else {
                alert("Please fill out all fields!");
            }
        });
    }

    // Render blogs (accessible to anyone)
    const blogsContainer = document.getElementById("blogs-container");
    if (blogsContainer) {
        blogsContainer.innerHTML = "";
        blogs.forEach((blog, index) => {
            const blogDiv = document.createElement("div");
            blogDiv.className = "blog";
            blogDiv.innerHTML = `
                <h3>${blog.title}</h3>
                <img src="${blog.imageUrl}" alt="Blog Image">
                <p>${blog.description}</p>
                <small>By ${blog.author} on ${new Date(blog.datetime).toLocaleString()}</small>
                <button onclick="updateBlog(${index})" class="update-button">Update</button>
                <button onclick="deleteBlog(${index})" class="delete-button">Delete</button>
            `;
            blogsContainer.appendChild(blogDiv);
        });
    }

    // Delete blog (only accessible by admin)
    window.deleteBlog = (index) => {
        if (confirm("Are you sure you want to delete this blog?")) {
            blogs.splice(index, 1);
            localStorage.setItem("blogs", JSON.stringify(blogs));
            location.reload();
        }
    };

    // Update blog (only accessible by admin)
    window.updateBlog = (index) => {
        const blog = blogs[index];
        const updateModal = document.getElementById("update-modal");
        const modalTitle = document.getElementById("update-title");
        const modalDescription = document.getElementById("update-description");
        const modalAuthor = document.getElementById("update-author");
        const modalImageInput = document.getElementById("update-image");
        const saveUpdateButton = document.getElementById("save-update");

        modalTitle.value = blog.title;
        modalDescription.value = blog.description;
        modalAuthor.value = blog.author;

        // Show update modal
        updateModal.style.display = "block";

        saveUpdateButton.onclick = () => {
            const updatedTitle = modalTitle.value;
            const updatedDescription = modalDescription.value;
            const updatedAuthor = modalAuthor.value;

            if (modalImageInput.files.length) {
                const reader = new FileReader();
                reader.onload = () => {
                    blog.imageUrl = reader.result; // Update image
                    saveUpdatedBlog();
                };
                reader.readAsDataURL(modalImageInput.files[0]);
            } else {
                saveUpdatedBlog();
            }

            function saveUpdatedBlog() {
                if (updatedTitle && updatedDescription && updatedAuthor) {
                    blogs[index] = {
                        ...blog,
                        title: updatedTitle,
                        description: updatedDescription,
                        author: updatedAuthor,
                    };
                    localStorage.setItem("blogs", JSON.stringify(blogs));
                    alert("Blog updated successfully!");
                    location.reload();
                } else {
                    alert("Please fill out all fields!");
                }
            }
        };
    };

    // Close update modal
    const closeUpdateModal = document.getElementById("close-update");
    if (closeUpdateModal) {
        closeUpdateModal.addEventListener("click", () => {
            document.getElementById("update-modal").style.display = "none";
        });
    }
});
