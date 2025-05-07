// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FilmRental {
    struct Film {
        string id;
        uint256 rentalPrice;
        bool isAvailable;
        address owner;
    }

    struct Rental {
        string filmId;
        address renter;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
    }

    mapping(string => Film) public films;
    mapping(address => Rental[]) public userRentals;
    address public owner;
    uint256 public rentalDuration = 24 hours; // Default rental duration

    event FilmAdded(string id, uint256 price);
    event FilmRented(string filmId, address renter);
    event RentalEnded(string filmId, address renter);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function addFilm(string memory _id, uint256 _rentalPrice) public onlyOwner {
        require(_rentalPrice > 0, "Rental price must be greater than 0");
        films[_id] = Film({
            id: _id,
            rentalPrice: _rentalPrice,
            isAvailable: true,
            owner: msg.sender
        });
        emit FilmAdded(_id, _rentalPrice);
    }

    function rentFilm(string memory _filmId) public payable {
        Film storage film = films[_filmId];
        require(film.isAvailable, "Film is not available for rent");
        require(msg.value >= film.rentalPrice, "Insufficient payment");

        // Create new rental
        userRentals[msg.sender].push(Rental({
            filmId: _filmId,
            renter: msg.sender,
            startTime: block.timestamp,
            endTime: block.timestamp + rentalDuration,
            isActive: true
        }));

        // Mark film as rented
        film.isAvailable = false;

        // Transfer payment to owner
        payable(film.owner).transfer(msg.value);

        emit FilmRented(_filmId, msg.sender);
    }

    function endRental(string memory _filmId) public {
        Rental[] storage rentals = userRentals[msg.sender];
        bool found = false;

        for (uint256 i = 0; i < rentals.length; i++) {
            if (keccak256(bytes(rentals[i].filmId)) == keccak256(bytes(_filmId)) && rentals[i].isActive) {
                rentals[i].isActive = false;
                films[_filmId].isAvailable = true;
                found = true;
                emit RentalEnded(_filmId, msg.sender);
                break;
            }
        }

        require(found, "No active rental found for this film");
    }

    function getRentalPrice(string memory _filmId) public view returns (uint256) {
        return films[_filmId].rentalPrice;
    }

    function isFilmAvailable(string memory _filmId) public view returns (bool) {
        return films[_filmId].isAvailable;
    }

    function getUserRentals(address _user) public view returns (Rental[] memory) {
        return userRentals[_user];
    }

    function setRentalDuration(uint256 _duration) public onlyOwner {
        rentalDuration = _duration;
    }
}
