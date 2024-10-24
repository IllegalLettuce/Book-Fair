$(document).ready(function () {
    // Toggle menu on small screens
    $('.menu-toggle').click(function () {
        $('.menu').toggle();
    });

    // Simulate book search
    $('#searchBtn').click(function () {
        const searchQuery = $('#bookSearch').val();
        if (searchQuery) {
            $('#bookResults').html(`<p>Searching for books related to "${searchQuery}"...</p>`);
            // Simulate a search result - you can replace this with actual data from a server
            setTimeout(function () {
                $('#bookResults').html(`<p>No books found for "${searchQuery}". Try another search.</p>`);
            }, 1000);
        } else {
            $('#bookResults').html('<p>Please enter a search term.</p>');
        }
    });
});
