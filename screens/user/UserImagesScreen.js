import React, {useState, useEffect, useCallback} from 'react';
import { View, Text, FlatList, Button, Platform, Alert, StyleSheet,ActivityIndicator,} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';

import HeaderButton from '../../components/UI/HeaderButton';
import ProductItem from '../../components/shop/ProductItem';
import Colors from '../../constants/Colors';
import * as imagesActions from '../../store/actions/images';

const UserImagesScreen = props => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const userImages = useSelector(state => state.images.userImages);
  const userId = useSelector(state => state.auth.userId);
  const user = useSelector(state =>state.images.availableUsers.find(prod => prod.id === userId)); 
  const dispatch = useDispatch();

  const loadProfile = useCallback(async () => {
    setError(null);
    setIsRefreshing(true);
    try {
      //await dispatch(userActions.fetchProfile());
      await dispatch(imagesActions.fetchImages());
    } catch (err) {
      console.log(err.message);
      setError(err.message);
    }
    setIsRefreshing(false);
  }, [dispatch, setIsLoading, setError]);

  useEffect(() => {
    setIsLoading(true);
    loadProfile().then(() => {
      setIsLoading(false);
    });
  }, [dispatch, loadProfile]);

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>An error occurred!</Text>
        <Button
          title="Try again"
          onPress={loadProfile}
          color={Colors.primary}
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const editImageHandler = id => {
    props.navigation.navigate('EditImage', { imageId: id });
  };

  const deleteHandler = id => {
    Alert.alert('Are you sure?', 'Do you really want to delete this item?', [
      { text: 'No', style: 'default' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: () => {
          dispatch(imagesActions.deleteImage(id));
        }
      }
    ]);
  };

  if (userImages.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No products found, maybe start creating some?</Text>
      </View>
    );
  }

  return (
    <FlatList
      onRefresh={loadProfile}
      refreshing={false}
      data={userImages}
      keyExtractor={item => item.id.toString()}
      renderItem={itemData => (
        <ProductItem
        image={itemData.item.imageUrl}
        description={itemData.item.description}
        createdAt={itemData.item.createdAt}
        userId = {itemData.item.userId}
        users = {[user]}
          onSelect={() => {
            editImageHandler(itemData.item.id);
          }}
        >
          {/* <Button
            color={Colors.primary}
            title="Edit"
            onPress={() => {
              editProductHandler(itemData.item.id);
            }}
          />
          <Button
            color={Colors.primary}
            title="Delete"
            onPress={deleteHandler.bind(this, itemData.item.id)}
          /> */}
        </ProductItem>
      )}
    />
  );
};

UserImagesScreen.navigationOptions = navData => {
  return {
    headerTitle: 'Gallery',
    headerLeft: ()=>(
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Menu"
          iconName={Platform.OS === 'android' ? 'md-menu' : 'ios-menu'}
          onPress={() => {
            navData.navigation.toggleDrawer();
          }}
        />
      </HeaderButtons>
    ),
    headerRight: () => (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Add"
          iconName={Platform.OS === 'android' ? 'md-add' : 'ios-add'}
          onPress={() => {
            navData.navigation.navigate('AddImage');
          }}
        />
      </HeaderButtons>
    )
  };
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default UserImagesScreen;
