// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

/*
    subspaces manager contract
    - map accounts to their posts
    - manage and track interactions (tips/responses/likes)
    ~ meta-transaction forwarder contracts:
    + [polygon mainnet] 0x86C80a8aa58e0A4fa09A69624c31Ab2a6CAD56b8
    + [mumbai testnet] 0x9399BB24DBB5C4b782C70c2969F58716Ebbd6a3b
*/

contract Manager is ERC2771Context, KeeperCompatibleInterface { 

    Broadcast[] public BroadcastIndex;

    struct Broadcast {
        // details
        uint256 id;
        uint256 date;
        address creator;
        string topic;
        string title;
        // ipfs refs
        string audioCID;
        string contextCID;       
        // user interactions 
        address[] likes; 
        address[] replies;
        address[] tips;
        // total revenue 
        uint256 earnings;
    }

    /// @notice maps for how exactly a user interacted

    /// @dev (broadcastID=>(user=>didLike?) 
    /// @notice used to prevent double likes
    mapping(
        uint256=>mapping(address=>bool)
    ) public BroadcastLikes;

    /// @dev (broadcastID=>(user=>allReplies[])
    /// @notice get all responses from a user
    mapping(
        uint256=>mapping(address=>string[])
    ) public BroadcastReplies;

    /// @dev (broadcastID=>(user=>tipped)
    /// @notice get tip amount given for a user
    mapping(
        uint256=>mapping(address=>uint256)
    ) public BroadcastTips;

    /// @notice user account metadata
    struct Profile {
        string username;
        string description;
        string[] socials;
        // ipfs image cids
        string image;
        string header;
        uint256 earnings;
        // IDs of all broadcast created
        uint256[] broadcasts;
        // IDs of all broadcasts liked/replied
        uint256[] interactions;
    }

    mapping (
        address=>Profile
    ) public UserProfile;

    ///@notice track all new broadcasts
    event NewBroadcast(uint256 broadcastID, address creator);
    ///@notice track overall tips/likes/replies 
    event Interaction(uint256 broadcastID, string typeOf, address initiator, address receiver);

    constructor(address _trustedForwarder) public ERC2771Context(_trustedForwarder) {}


    // ******************** Account Management ********************

    /// @notice methods will set profile data for the account which calls them 

    function setProfileImage(string memory cid) public {
        UserProfile[_msgSender()].image = cid;
    }
    function setProfileHeader(string memory cid) public {
        UserProfile[_msgSender()].header = cid;
    }
    // @notice displayed alongside address - not unique to platform
    function setProfileUsername(string memory name) public {
        UserProfile[_msgSender()].username = name;
    }
    function setProfileDescription(string memory bio) public {
        UserProfile[_msgSender()].description = bio;
    }
    function setProfileSocials(string[] memory links) public {
        UserProfile[_msgSender()].socials = links;
    }

    // ******************** Interaction Mechanisms  ********************

    function createBroadcast(string memory topic, string memory title, string memory audio, string memory context) public {
        uint256 newID = BroadcastIndex.length + 1;
        BroadcastIndex.push(Broadcast({
            id:newID,
            topic:topic,
            title:title,
            creator:_msgSender(),
            audioCID:audio,
            contextCID:context,
            date:block.timestamp,
            replies: new address[](0),
            likes: new address[](0),
            tips: new address[](0),
            earnings:0
        }));
        // add it to user records
        UserProfile[_msgSender()].broadcasts.push(newID);
        emit NewBroadcast(newID, _msgSender());
    }

     /// @param id -> broadcast number
    function like(uint256 id) public {
        Broadcast storage broadcast = BroadcastIndex[id-1];
        require(BroadcastLikes[id][_msgSender()] == false, "Already Liked");
        BroadcastLikes[id][_msgSender()] = true;
        broadcast.likes.push(_msgSender());
        UserProfile[_msgSender()].interactions.push(id);
        emit Interaction(id, "like", _msgSender(), broadcast.creator);
    }

    /// @param id -> broadcast number
    /// @param cid -> ipfs reference of audio response
    function reply(uint256 id, string memory cid) public {
        Broadcast storage broadcast = BroadcastIndex[id-1];
        BroadcastReplies[id][_msgSender()].push(cid);
        broadcast.replies.push(_msgSender());
        UserProfile[_msgSender()].interactions.push(id);
        emit Interaction(id, "reply", _msgSender(), broadcast.creator);
    }

    /// @notice send a tip directly to a creator address 
    /// @param id -> broadcast number
    function tip(uint256 id) public payable {
        require(msg.value > 0, "No Value Detected");
        Broadcast storage broadcast = BroadcastIndex[id-1];
        (bool success, ) = address(broadcast.creator).call{value: msg.value}("");
        require(success, "Failed to Send Funds");
        BroadcastTips[id][_msgSender()] += msg.value;
        broadcast.tips.push(_msgSender());
        broadcast.earnings += msg.value;
        UserProfile[broadcast.creator].earnings += msg.value;
        emit Interaction(id, "tip", _msgSender(), broadcast.creator);
    }

    // ******************** Data Retreival  ********************

    /// @notice returns number of broadcasts created
    function totalBroadcasts() public view returns (uint256){
        return BroadcastIndex.length;
    }

    /// @dev pair broadcast functions with the mappings to see how users interacted

    /// @notice returns unique array of users who liked 
    function getBroadcastLikes(uint256 id) public view returns(address[] memory){
        Broadcast storage broadcast = BroadcastIndex[id-1];
        return broadcast.likes;
    }

    /// @notice returns array of users based on order replied (can contain duplicates)
    function getBroadcastReplies(uint256 id) public view returns(address[] memory){
        Broadcast storage broadcast = BroadcastIndex[id-1];
        return broadcast.replies;
    }

    /// @notice returns array of users based on order tipped (can contain duplicates)
    function getBroadcastTips(uint256 id) public view returns(address[] memory){
        Broadcast storage broadcast = BroadcastIndex[id-1];
        return broadcast.tips;
    }

    /// @notice get the IDs of all broadcasts a user created
    function getUserBroadcasts(address user) public view returns(uint256[] memory){
        return UserProfile[user].broadcasts;
    }
    /// @notice get the IDs of all broadcasts a user interacted with 
    function getUserInteractions(address user) public view returns(uint256[] memory){
        return UserProfile[user].interactions;
    }

    /// @notice get the CIDs of user responses for a broadcast
    function getUserReplies(address user, uint256 id) public view returns(string[] memory){
        return BroadcastReplies[id][user];
    }

    // ******************** Automation Integrations (experimental)  ********************

    /// @notice check the status of the scheduled dates, if greater then upkeep needed
    function checkUpkeep(bytes calldata /*checkData*/) external view override returns (bool upkeepNeeded, bytes memory performData) {
        upkeepNeeded = true;
        // if a selected timestamp is greater than the current then it is ready for execution
        for(uint i = 0; i < ScheduledDates.length; i++){
           if(ScheduledDates[i] > block.timestamp){
               upkeepNeeded = true;
           }
        }
        return (upkeepNeeded,"");
    }

    /// @notice performs the automation when flagged by checkUpKeep
    function performUpkeep(bytes calldata /* performData */) external override {
        for(uint i = 0; i < ScheduledDates.length; i++){
           if(ScheduledDates[i] > block.timestamp){
               // instances
               uint256 date = ScheduledDates[i];
               address user = Requestors[date];
                // finalize settings
                uint256 newID = BroadcastIndex.length + 1;
                ScheduledPosts[date][user].id = newID;
                ScheduledPosts[date][user].date = block.timestamp;
                // push broadcast on behalf of user
                BroadcastIndex.push(ScheduledPosts[date][user]);
                // remove instanes
                delete ScheduledDates[i];
                delete Requestors[date];
                delete ScheduledPosts[date][user];
           }
        }
    }

     /* @notice sets a broadcast to be published after a certain time, where only 
     then will it be applied to the official broadcast index and user profile, the 
     user can cancel the broadcast from being published at any time before hand */

    /// @param time -> date for broadcast to be pushed and recognized by the contract 
    /// @dev added to a pool of broadcasts waiting to be published
    function automateBroadcast(uint256 time, string memory topic, string memory title, string memory audio, string memory context) public {
        require(time > block.timestamp, "Must be greater than current time");
        Broadcast memory toPublish = Broadcast({
            // set later
            id:0,
            creator:msg.sender,
            topic:topic,
            title:title,
            audioCID:audio,
            contextCID:context,
            // exact timestamp set later
            date:0,
            replies: new address[](0),
            likes: new address[](0),
            tips: new address[](0),
            earnings:0
        });

        ScheduledDates.push(time);
        Requestors[time] = msg.sender;
        ScheduledPosts[time][msg.sender] = toPublish;
    }

    /// @notice cancel a broadcast from being recognized on the index and user profile
    function cancelBroadcast(uint256 date) public {
       require(msg.sender == ScheduledPosts[date][msg.sender].creator, "Didn't Create Broadcast");
        for(uint i = 0; i < ScheduledDates.length; i++){
            if(ScheduledDates[i] == date){
                delete ScheduledDates[i];
            }
        }
        // remove other instanes
        delete Requestors[date];
        delete ScheduledPosts[date][msg.sender];
    }

    /// @notice get the instance of a post to later be published
    function getScheduledUserPost(uint256 date, address user) public view returns (Broadcast memory) {
        return ScheduledPosts[date][user];
    }

    /// @notice total scheduled timestamps to be checked with keepers 
    uint256[] ScheduledDates;
    // @notice users requesting a scheduled post
    mapping(uint256=>address) Requestors;
    /// @dev (date->(user->toPublish)
    mapping(uint256=>mapping(address=>Broadcast)) ScheduledPosts;
   
    /// @dev keeping track of meta transaction base relay recipient
     function versionRecipient() external view returns (string memory) {
         return "1";
     }

}