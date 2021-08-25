import React from 'react';
import loadingGIF from '../../images/loading.gif';

const Loading = ({ ...imgProps }) => <img src={loadingGIF} alt="loading..." {...imgProps} />;

export default Loading;
