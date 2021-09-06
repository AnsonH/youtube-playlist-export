/**
 * Action handler for `ytpl-export id [options] <playlistId>`
 * @param {string} playlistId   Command argument - ID of playlist to be exported
 * @param {{default: boolean}} options  Command options
 */
const idActionHandler = (playlistId, options) => {
  console.log(playlistId);
  console.log(options);
};

export default idActionHandler;
