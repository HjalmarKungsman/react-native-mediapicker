import React,{Component} from 'react'
import {
  CameraRoll
  ,Platform
  ,StyleSheet
  ,View
  ,ListView
} from 'react-native'

import SGListView from 'react-native-sglistview'
import MediaItem from './MediaItem'

class MediaPicker extends Component{
  constructor(props) {
    super(props);
    this.state = {
      images: [],
      selected:[],
      selectedItems:[],
      dataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    }
  }

  componentWillMount() {

    //Fetch
    var fetchParams = {
      first: 10000,
      groupTypes: this.props.groupTypes,
      assetType: this.props.assetType,
    };

    if (Platform.OS === "android") delete fetchParams.groupTypes;
    if (this.state.lastCursor) fetchParams.after = this.state.lastCursor;

    CameraRoll.getPhotos(fetchParams)
      .then((data) => {
        var rows=[];
        while (data.edges.length > 0){
            rows.push(data.edges.splice(0,this.props.imagesPerRow));
        }
        this.setState({dataSource: this.state.dataSource.cloneWithRows(rows)})
      });
  }

  render(){
    return (
      <View style={[ styles.wrapper, { padding: this.props.imageMargin, paddingRight: 0, backgroundColor: this.props.backgroundColor}, ]}>
        <SGListView
          stickyHeaderIndices={this.props.stickyHeaderIndices}
          onEndReachedThreshold={this.props.onEndReachedThreshold}
          initialListSize={this.props.initialListSize}
          pageSize={this.props.pageSize}
          scrollRenderAheadDistance={this.props.scrollRenderAheadDistance}
          style={styles.list}
          contentContainerStyle={styles.listContainer}
          dataSource={this.state.dataSource}
          renderRow={rowData => this.renderRow(rowData) } />
      </View>
    );
  }
  renderRow(data){
    var items = data.map((item,key) => {
      if (item === null) {
        return null;
      }

      var signature = item.node.image.uri
      var index = this.state.selected.indexOf(signature)
      if (index >= 0) this.selected = true
      else this.selected = false
        
      return (
        <MediaItem 
          key={key}
          item={item} 
          selected={this.selected}
          showLoading={this.props.showLoading}
          imageMargin={this.props.imageMargin}
          imagesPerRow={this.props.imagesPerRow}
          selectedMarker={this.state.selectedMarker}
          onClick={item => this._handleClick(item)}/>
      )
    })
    return(
      <View style={styles.row}>
        {items}
      </View>
    )
  }

  _handleClick(item){
    var uri = item.uri

    let selectedItem = {
      filename: item.filename
    };

    var selected = this.state.selected
    var selectedItems = this.state.selectedItems
    var index = selected.indexOf(uri)

    if (index >= 0) { 
      selected.splice(index, 1)
      selectedItems.splice(index, 1)
    } else {
      if (selected.length < this.props.maximum) {
        selected.push(uri)
        selectedItems.push(selectedItem)
      } else {
        selected.shift()
        selectedItems.shift()

        selected.push(uri)
        selectedItems.push(selectedItem)
      }
    }
    this.setState({selected: selected}) 
    this.props.callback(this.state.selected, this.state.selectedItems)
    
    // Empties state-arrays after callback:
    this.setState({selected: []})
    this.setState({selectedItems: []})  
  }
}

const styles = StyleSheet.create({
  wrapper:{
    flex: 1,
  },
  listContainer: {
    flexDirection: 'column',
  },
  row:{
    flexDirection: 'row',
  },
})

MediaPicker.propTypes = {
  callback: React.PropTypes.func.isRequired,
  groupTypes: React.PropTypes.oneOf([
    'Album',
    'All',
    'Event',
    'Faces',
    'Library',
    'PhotoStream',
    'SavedPhotos',
  ]),
  maximum: React.PropTypes.number,
  assetType: React.PropTypes.oneOf([
    'Photos',
    'Videos',
    'All',
  ]),
  imagesPerRow: React.PropTypes.number,
  imageMargin: React.PropTypes.number,
  selectedMarker: React.PropTypes.element,
  backgroundColor: React.PropTypes.string,
  selected: React.PropTypes.array,
  showLoading: React.PropTypes.bool,
}
MediaPicker.defaultProps = {
  groupTypes: 'SavedPhotos',
  maximum: 15,
  imagesPerRow: 3,
  imageMargin: 5,
  assetType: 'Photos',
  backgroundColor: 'white',
  stickyHeaderIndices: [],
  onEndReachedThreshold: 1000,
  initialListSize: 10,
  scrollRenderAheadDistance: 50,
  pageSize: 24,
  selected: [],
  showLoading: true,
  callback: (d) => {
    console.log(d)
  },
}

export default MediaPicker
