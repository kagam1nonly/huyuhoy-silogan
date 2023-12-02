-- Functions

DELIMITER $$
CREATE DEFINER=`root`@`localhost` FUNCTION `CalculateTotalCustomers`() RETURNS int
BEGIN
    DECLARE total_customers INT;
    SELECT COUNT(*) INTO total_customers FROM auth_user WHERE is_superuser = 0;
    RETURN total_customers;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` FUNCTION `CalculateTotalOrderedMeals`() RETURNS int
BEGIN
    DECLARE total_ordered_meals INT;
    SELECT COUNT(DISTINCT cartitem_id) INTO total_ordered_meals FROM food_cartitem;
    RETURN total_ordered_meals;
END$$
DELIMITER ;

DELIMITER $$
USE `huyuhoydb`$$
CREATE DEFINER=`root`@`localhost` FUNCTION `CalculateTotalRevenue`() RETURNS decimal(10,2)
READS SQL DATA
BEGIN
    DECLARE total DECIMAL(10, 2);
    SELECT SUM(amount) INTO total FROM food_payment WHERE payment_status = 'Paid';
    RETURN total;
END$$
DELIMITER ;

-- Functions

-- Procedures

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `AcceptRefuseOrder`(IN orderId INT, IN action VARCHAR(10), IN adminId INT)
BEGIN
    -- Check if the admin exists and is authorized
    DECLARE isAdmin INT;
    DECLARE orderExists INT;
    
    SELECT COUNT(*) INTO isAdmin
    FROM auth_user
    WHERE id = adminId AND is_superuser = 1;

	IF isAdmin = 1 THEN
	-- Check if the order exists
		
        SELECT COUNT(*) INTO orderExists
        FROM food_order
        WHERE id = orderId;

        IF orderExists = 1 THEN
            -- Update the order status based on the action
            IF action = 'Accept' THEN
                UPDATE food_order
                SET status = 'Processing'
                WHERE id = orderId;
            ELSEIF action = 'Refuse' THEN
                UPDATE food_order
                SET status = 'Canceled'
                WHERE id = orderId;
			ELSEIF action = 'Complete' THEN
                UPDATE food_order
                SET status = 'Completed'
                WHERE id = orderId;
            END IF;

            SELECT 'Order ' + action + 'ed successfully' AS result;
        ELSE
            SELECT 'Order not found' AS result;
        END IF;
    ELSE
        SELECT 'Admin not authorized' AS result;
    END IF;
END$$
DELIMITER ;



DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `CalculateTotalBillForCustomer`(IN customerID INT)
BEGIN
    SELECT SUM(bill) AS totalBill
    FROM food_order
    WHERE customer_id = customerID AND status = 'processing';
END$$
DELIMITER ;
DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `CancelCustomerOrder`(IN orderNumber VARCHAR(255), IN customerID INT)
BEGIN
    -- Check if the order exists and is owned by the customer
    DECLARE orderExists INT;
    SELECT COUNT(*) INTO orderExists
    FROM food_order
    WHERE number = orderNumber AND customer_id = customerID;

    -- If the order exists and is owned by the customer, and the status is "Processing" or "Pending," mark it as canceled
    IF orderExists = 1 THEN
        UPDATE food_order
        SET status = 'Canceled'
        WHERE number = orderNumber AND (status = 'Processing' OR status = 'Pending');

        SELECT 'Order canceled successfully' AS result;
    ELSE
        SELECT 'Order not found or you are not the owner' AS result;
    END IF;
END$$
DELIMITER ;

-- Triggers 

DELIMITER //
CREATE TRIGGER PreventAdminActionUpdate
BEFORE UPDATE ON food_order
FOR EACH ROW
BEGIN
    IF NEW.status IN ('Accepted', 'Refused') AND OLD.status IN ('Accepted', 'Refused') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot update order status to Accepted or Refused if already marked as such.';
    END IF;
END;
//
DELIMITER ;






